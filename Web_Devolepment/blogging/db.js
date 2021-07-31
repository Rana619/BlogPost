const mysql = require('mysql2');
const _ = require("lodash");

const connection = mysql.createConnection({
    host : 'localhost',
    port: '3306',
    user: 'root',
    password:'Rana@1702',
    database : 'mycswallpost'
});





function getAllPersons(){
    return new Promise(function(resolve,reject){
        connection.query(
            `SELECT * FROM mycswallpost ORDER BY ID DESC`,
            function(err,rows,cols){
                if(err){
                    reject(err)
                }
                else{  
                    resolve(rows) 
                }
            }
        )
    })
}
// for search
function getAllPostsbyTitel(postTitel){
    return new Promise(function(resolve,reject){

        connection.query(
            `SELECT * FROM mycswallpost 
             WHERE PostTitel = ?
             ORDER BY ID DESC `,
             [postTitel],
            function(err,rows,cols){
                if(err){
                    reject(err)
                }
                else{
                    resolve(rows)    
                       
                }
            }
        )

    })
}

function addNewPerson(Fname,Lname,about,Email,PostPassW,PostTitel,PostCont)
{
    return new Promise(function(resolve,reject){
        connection.query(
            `INSERT INTO mycswallpost (Fname,Lname,about,Email,PostPassW,PostTitel,PostCont) VALUES (?,?,?,?,?,?,?)`,
             [Fname,Lname,about,Email,PostPassW,PostTitel,PostCont],
            function(err,results){
                if(err){
                    reject(err)
                }
                else{
                    resolve() 
                }
            }
        ) 
    })
}

function addNewComment(postID,userEmail,Comments)
{
    return new Promise(function(resolve,reject){
        connection.query(
            `INSERT INTO postcomments (PostID,emailID,comments) VALUES (?,?,?)`,
             [postID,userEmail,Comments],
            function(err,results){
                if(err){
                    reject(err)
                }
                else{
                    resolve(results) 
                }
            }
        )
    })
}

function findSinglePost(requestedTitel,PostID)
{
    return new Promise(function(resolve,reject){
        let tak = connection.query(
            `SELECT * FROM mycswallpost 
            WHERE PostTitel = ?
            AND ID = ?
           `,
           [requestedTitel,PostID],
             (err,rows,cols) => {
                 
                if(err){
                    reject(err)
                }
                else{
                    console.log(rows.length)
                    resolve(rows)
                }


     });

    })
}
function findSinglePostforcheck(fname,lname,email,passw)
{
    return new Promise(function(resolve,reject){
        let tak = connection.query(
            `SELECT * FROM mycswallpost 
            WHERE ( Fname = ? AND Lname = ? ) AND (Email = ? AND PostPassW = ?)`,
           [fname,lname,email,passw],
             (err,rows,cols) => {
                 
                if(err){
                    reject(err)
                }
                else{
                    console.log(rows.length)
                    resolve(rows.length)
                }


     });

    })
}





function findPostComments(PostID)
{
    return new Promise(function(resolve,reject){
        let tak = connection.query(
            `SELECT * FROM postcomments 
             WHERE PostID = ?
           `,
           [PostID],
             (err,rows,cols) => {
                 
                if(err){
                    reject(err)
                }
                else{
                    console.log(rows.length)
                    resolve(rows)
                }


     });

    })
}




function findSinglePostMF(PostID,passtext)
{
    return new Promise(function(resolve,reject){
        let tak = connection.query(
            `SELECT * FROM mycswallpost 
            WHERE ID = ?
            AND PostPassW = ?
           `,
           [PostID,passtext],
             (err,rows,cols) => {
                 
                if(err){
                    reject(err)
                }
                else{
                    console.log(rows.length)
                    resolve(rows)
                }


     });

    })
}

function deleteSinglePost(PostId,postPassword)
{   
    console.log(PostId)
    return new Promise(function(resolve,reject){
     let tak = connection.query(
            `DELETE FROM mycswallpost 
             WHERE ID = ?
             AND PostPassW = ?
            `,
            [PostId,postPassword],
            function(err,result){
                if(err){
                    reject(err)
                }
                else{
                    console.log(result.affectedRows) 
                    resolve(result.affectedRows)
                }
            }
           )

    })
    
}
function deleteRelatedComments(PostId)
{   
    console.log(PostId)
    return new Promise(function(resolve,reject){
     let tak = connection.query(
            `DELETE FROM postcomments  
             WHERE PostID = ?
            `,
            [PostId],
            function(err,result){
                if(err){
                    reject(err)
                }
                else{
                    console.log(result.affectedRows) 
                    resolve(result.affectedRows)
                }
            }
           )

    })
    
}
function updateSinglePost(postCont,PostId,postTitel)
{   
    console.log(PostId)
    return new Promise(function(resolve,reject){
    
     let tak = connection.query(
            `UPDATE mycswallpost SET PostCont = ?
             WHERE ID = ?
             AND PostTitel = ?
            `,
            [postCont,PostId,postTitel],
            function(err,result){
                if(err){
                    reject(err)
                }
                else{
                    resolve(result.affectedRows)
                }
            }
           )

    })
    
}


exports = module.exports={
    getAllPersons,
    addNewPerson,
    findSinglePost,
    deleteSinglePost,
    findSinglePostMF,
    updateSinglePost,
    addNewComment,
    findPostComments,
    getAllPostsbyTitel,
    deleteRelatedComments,
    findSinglePostforcheck
} 